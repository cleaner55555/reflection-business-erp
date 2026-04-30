import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/integrations/jobs — List all integration jobs
export async function GET() {
  try {
    const jobs = await db.integrationJob.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching integration jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration jobs' },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/jobs — Delete one or more integration jobs
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, id } = body;

    // Support both single id and array of ids
    let idsToDelete: string[] = [];

    if (Array.isArray(ids) && ids.length > 0) {
      idsToDelete = ids;
    } else if (typeof id === 'string' && id.length > 0) {
      idsToDelete = [id];
    } else {
      return NextResponse.json(
        { error: 'Provide "id" (string) or "ids" (string[]) to delete' },
        { status: 400 }
      );
    }

    // Validate all IDs exist before deleting
    const existingJobs = await db.integrationJob.findMany({
      where: { id: { in: idsToDelete } },
      select: { id: true },
    });

    const existingIds = new Set(existingJobs.map((j) => j.id));
    const notFound = idsToDelete.filter((i) => !existingIds.has(i));

    if (notFound.length > 0 && notFound.length === idsToDelete.length) {
      return NextResponse.json(
        { error: `No jobs found with the provided IDs` },
        { status: 404 }
      );
    }

    // Delete only the jobs that exist
    const toDelete = idsToDelete.filter((i) => existingIds.has(i));
    const result = await db.integrationJob.deleteMany({
      where: { id: { in: toDelete } },
    });

    return NextResponse.json({
      deletedCount: result.count,
      notFound: notFound.length > 0 ? notFound : undefined,
    });
  } catch (error) {
    console.error('Error deleting integration jobs:', error);
    return NextResponse.json(
      { error: 'Failed to delete integration jobs' },
      { status: 500 }
    );
  }
}
