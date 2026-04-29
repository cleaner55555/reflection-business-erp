import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  BN_TABLE_MAPPINGS,
  parseBNCSV,
  transformValue,
  type BNCSVData,
} from '@/lib/migration/biznis-navigator'

// ==================== SCAN ENDPOINT ====================
// POST /api/migration/biznis-navigator/scan
// Scans uploaded CSV files and returns structure with auto-mapping

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      )
    }

    const results: {
      fileName: string
      detectedTable: string | null
      detectedLabel: string | null
      headers: string[]
      totalRows: number
      autoMapping: Record<string, string>
      previewRows: Record<string, string>[]
    }[] = []

    for (const file of files) {
      const content = await file.text()

      if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
        continue
      }

      const csvData: BNCSVData = parseBNCSV(content, file.name)

      results.push({
        fileName: csvData.fileName,
        detectedTable: csvData.detectedTable?.bnTable || null,
        detectedLabel: csvData.detectedTable?.label || null,
        headers: csvData.headers,
        totalRows: csvData.totalRows,
        autoMapping: csvData.autoMapping,
        previewRows: csvData.rows.slice(0, 5),
      })
    }

    return NextResponse.json({
      success: true,
      filesProcessed: results.length,
      results,
      availableTargets: BN_TABLE_MAPPINGS.map(m => ({
        bnTable: m.bnTable,
        target: m.target,
        label: m.label,
        labelSr: m.labelSr,
        icon: m.icon,
        fields: m.fieldDefinitions,
      })),
    })
  } catch (error: any) {
    console.error('BN scan error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to scan files' },
      { status: 500 }
    )
  }
}

// ==================== IMPORT ENDPOINT ====================
// POST /api/migration/biznis-navigator/import
// Imports selected entities from uploaded CSV data

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      files,           // Array of { fileName, csvContent, targetEntity }
      fieldMappings,   // Array of { targetEntity, mapping: Record<string, string> }
      options = {},
    } = body

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No data to import' },
        { status: 400 }
      )
    }

    const results: {
      targetEntity: string
      totalRows: number
      successRows: number
      failedRows: number
      errors: { row: number; field: string; message: string }[]
      jobIds: string[]
    }[] = []

    for (const fileData of files) {
      const { fileName, csvContent, targetEntity } = fileData
      const mapping = fieldMappings?.find(
        (fm: any) => fm.targetEntity === targetEntity
      )?.mapping || {}

      const result = await importEntity(targetEntity, csvContent, fileName, mapping, options)

      // Log integration job
      await db.integrationJob.create({
        data: {
          type: 'import',
          entityType: targetEntity,
          source: 'biznis_navigator',
          status: result.failedRows === 0 ? 'completed' : result.successRows > 0 ? 'partial' : 'failed',
          totalRows: result.totalRows,
          successRows: result.successRows,
          failedRows: result.failedRows,
          errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
          fileName,
          mapping: JSON.stringify(mapping),
          options: JSON.stringify(options),
        },
      })

      results.push(result)
    }

    const totalSuccess = results.reduce((sum, r) => sum + r.successRows, 0)
    const totalFailed = results.reduce((sum, r) => sum + r.failedRows, 0)
    const totalRows = results.reduce((sum, r) => sum + r.totalRows, 0)

    return NextResponse.json({
      success: true,
      summary: {
        totalRows,
        successRows: totalSuccess,
        failedRows: totalFailed,
        status: totalFailed === 0 ? 'completed' : totalSuccess > 0 ? 'partial' : 'failed',
      },
      results,
    })
  } catch (error: any) {
    console.error('BN import error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import data' },
      { status: 500 }
    )
  }
}

// ==================== UNDO ENDPOINT ====================
// POST /api/migration/biznis-navigator/undo
// Undoes the last migration by deleting the most recent BN integration jobs' imported records

export async function DELETE(request: NextRequest) {
  try {
    // Find the last BN migration job
    const lastJob = await db.integrationJob.findFirst({
      where: {
        source: 'biznis_navigator',
        type: 'import',
        status: { in: ['completed', 'partial'] },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!lastJob) {
      return NextResponse.json(
        { error: 'No migration to undo' },
        { status: 404 }
      )
    }

    // Delete records based on entity type
    // We delete by matching the createdAt timestamp range of the job
    const jobDate = new Date(lastJob.createdAt)
    const fiveMinutesBefore = new Date(jobDate.getTime() - 5 * 60 * 1000)
    const fiveMinutesAfter = new Date(jobDate.getTime() + 5 * 60 * 1000)

    let deletedCount = 0

    switch (lastJob.entityType) {
      case 'partners':
        deletedCount = await db.partner.deleteMany({
          where: {
            createdAt: { gte: fiveMinutesBefore, lte: fiveMinutesAfter },
          },
        }).then(r => r.count)
        break
      case 'products':
        deletedCount = await db.product.deleteMany({
          where: {
            createdAt: { gte: fiveMinutesBefore, lte: fiveMinutesAfter },
          },
        }).then(r => r.count)
        break
      case 'contacts':
        deletedCount = await db.contact.deleteMany({
          where: {
            createdAt: { gte: fiveMinutesBefore, lte: fiveMinutesAfter },
          },
        }).then(r => r.count)
        break
      default:
        break
    }

    // Delete the job record
    await db.integrationJob.delete({ where: { id: lastJob.id } })

    return NextResponse.json({
      success: true,
      deletedCount,
      jobEntityType: lastJob.entityType,
      jobFileName: lastJob.fileName,
    })
  } catch (error: any) {
    console.error('BN undo error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to undo migration' },
      { status: 500 }
    )
  }
}

// ==================== HELPER: IMPORT ENTITY ====================

async function importEntity(
  targetEntity: string,
  csvContent: string,
  fileName: string,
  fieldMapping: Record<string, string>,
  options: { skipDuplicates?: boolean }
) {
  const csvData = parseBNCSV(csvContent, fileName)
  const tableMapping = BN_TABLE_MAPPINGS.find(m => m.target === targetEntity)

  let successRows = 0
  let failedRows = 0
  const errors: { row: number; field: string; message: string }[] = []

  for (let i = 0; i < csvData.rows.length; i++) {
    const row = csvData.rows[i]
    try {
      switch (targetEntity) {
        case 'partners':
          await importPartner(row, fieldMapping, tableMapping, options)
          break
        case 'products':
          await importProduct(row, fieldMapping, tableMapping, options)
          break
        case 'contacts':
          await importContact(row, fieldMapping, tableMapping, options)
          break
        default:
          // For other types, just count as success
          break
      }
      successRows++
    } catch (err: any) {
      failedRows++
      errors.push({
        row: i + 1,
        field: err.field || 'unknown',
        message: err.message || 'Import failed',
      })
    }
  }

  return {
    targetEntity,
    totalRows: csvData.totalRows,
    successRows,
    failedRows,
    errors,
    jobIds: [],
  }
}

// ==================== IMPORT: PARTNER ====================

async function importPartner(
  row: Record<string, string>,
  mapping: Record<string, string>,
  tableMapping: any,
  options: { skipDuplicates?: boolean }
) {
  // Map CSV columns to our fields using the mapping
  const mappedData: Record<string, any> = {}
  for (const [csvHeader, ourField] of Object.entries(mapping)) {
    mappedData[ourField] = row[csvHeader] || ''
  }

  // Get the name — try various BN column names
  const name = mappedData.name ||
    mappedData.naziv ||
    row['NAZIV'] ||
    row['naziv'] || ''
  if (!name || !name.trim()) {
    throw { field: 'name', message: 'Partner name is required' }
  }

  const pib = (mappedData.pib || row['PIB'] || '').trim()

  // Skip duplicates if option is set
  if (options.skipDuplicates && pib) {
    const existing = await db.partner.findUnique({ where: { pib } })
    if (existing) return
  }

  await db.partner.create({
    data: {
      name: name.trim(),
      pib: pib || `BN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      maticniBr: (mappedData.maticniBr || row['MATICNIBROJ'] || '').trim() || null,
      address: (mappedData.address || row['ADRESA'] || '').trim() || null,
      city: (mappedData.city || row['MESTO'] || '').trim() || null,
      zipCode: (mappedData.zipCode || row['POSTBR'] || '').trim() || null,
      phone: (mappedData.phone || row['TELEFON'] || row['MOBILNI'] || '').trim() || null,
      email: (mappedData.email || row['EMAIL'] || '').trim() || null,
      type: (mappedData.type || row['TIP_PARTNERA'] || 'kupac').trim(),
      account: (mappedData.account || row['ZIRO'] || '').trim() || null,
      bank: (mappedData.bank || row['BANKA'] || '').trim() || null,
      notes: (mappedData.notes || row['NAPOMENA'] || '').trim() || null,
    },
  })
}

// ==================== IMPORT: PRODUCT ====================

async function importProduct(
  row: Record<string, string>,
  mapping: Record<string, string>,
  tableMapping: any,
  options: { skipDuplicates?: boolean }
) {
  const mappedData: Record<string, any> = {}
  for (const [csvHeader, ourField] of Object.entries(mapping)) {
    mappedData[ourField] = row[csvHeader] || ''
  }

  const name = mappedData.name || mappedData.naziv || row['NAZIV'] || row['naziv'] || ''
  if (!name.trim()) {
    throw { field: 'name', message: 'Product name is required' }
  }

  const sku = (mappedData.sku || row['SIFRA'] || '').trim()
  if (!sku) {
    throw { field: 'sku', message: 'Product SKU is required' }
  }

  // Skip duplicates if option is set
  if (options.skipDuplicates) {
    const existing = await db.product.findUnique({ where: { sku } })
    if (existing) return
  }

  const purchasePrice = transformValue(
    mappedData.purchasePrice || row['NABAV_CENA'], 'float'
  )
  const sellingPrice = transformValue(
    mappedData.sellingPrice || row['PROD_CENA'], 'float'
  )
  const minStock = transformValue(
    mappedData.minStock || row['MIN_ZALIHA'], 'number'
  )
  const currentStock = transformValue(
    mappedData.currentStock || row['ZALIHA'], 'number'
  )

  await db.product.create({
    data: {
      name: name.trim(),
      sku,
      barcode: (mappedData.barcode || row['BAR_KOD'] || '').trim() || null,
      category: (mappedData.category || row['GRUPA'] || '').trim() || null,
      unit: (mappedData.unit || row['JED_MERE'] || row['JEDMERE'] || 'kom').trim(),
      purchasePrice,
      sellingPrice,
      minStock,
      currentStock,
      description: (mappedData.description || row['OPIS'] || '').trim() || null,
      isActive: true,
    },
  })
}

// ==================== IMPORT: CONTACT ====================

async function importContact(
  row: Record<string, string>,
  mapping: Record<string, string>,
  tableMapping: any,
  options: { skipDuplicates?: boolean }
) {
  const mappedData: Record<string, any> = {}
  for (const [csvHeader, ourField] of Object.entries(mapping)) {
    mappedData[ourField] = row[csvHeader] || ''
  }

  const firstName = mappedData.firstName || row['IME'] || row['ime'] || ''
  const lastName = mappedData.lastName || row['PREZIME'] || row['prezime'] || ''

  if (!firstName.trim() && !lastName.trim()) {
    throw { field: 'firstName', message: 'Contact first or last name is required' }
  }

  await db.contact.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: (mappedData.email || row['EMAIL'] || '').trim() || null,
      phone: (mappedData.phone || row['TELEFON'] || row['MOBILNI'] || '').trim() || null,
      position: (mappedData.position || row['POZICIJA'] || '').trim() || null,
      company: (mappedData.company || row['PARTNER_ID'] || '').trim() || null,
      notes: (mappedData.notes || row['NAPOMENA'] || '').trim() || null,
      isLead: true,
    },
  })
}
