"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Receipt,
  BarChart3,
  RotateCcw,
  CircleDollarSign,
} from "lucide-react";
import type { DailyStats, Receipt as ReceiptType } from "./types";
import { formatRsd, formatDateTimeSr, COMPANY_INFO } from "./data";

// ================================================================
// STATS CARDS ROW
// ================================================================

interface StatsCardsProps {
  stats: DailyStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Дневни приhod",
      value: formatRsd(stats.dnevniPrihod),
      description: "укупна продаја данас",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Број рачуна",
      value: String(stats.brojRacuna),
      description: "издато данас",
      icon: Receipt,
      color: "text-blue-600",
    },
    {
      title: "Просек по рачуну",
      value: formatRsd(stats.prosek),
      description: "просечна вредност",
      icon: BarChart3,
      color: "text-amber-600",
    },
    {
      title: "Поврат / Сторно",
      value: formatRsd(stats.povrat),
      description: "укупно поврата",
      icon: RotateCcw,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ================================================================
// RECEIPT PREVIEW (Modal/Print)
// ================================================================

interface ReceiptPreviewProps {
  receipt: ReceiptType | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiptPreview({
  receipt,
  open,
  onClose,
}: ReceiptPreviewProps) {
  if (!receipt || !open) return null;

  const pdvLines = receipt.lines.reduce<
    Record<number, { base: number; tax: number }>
  >((acc, line) => {
    if (!acc[line.pdvRate]) acc[line.pdvRate] = { base: 0, tax: 0 };
    acc[line.pdvRate].base += line.baseAmount;
    acc[line.pdvRate].tax += line.pdvAmount;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-white text-black w-full max-w-sm mx-auto rounded-lg shadow-xl font-mono text-xs"
        id="receipt-print"
      >
        {/* Header */}
        <div className="text-center pt-6 pb-2 px-4">
          <p className="font-bold text-sm">{COMPANY_INFO.name}</p>
          <p>{COMPANY_INFO.address}</p>
          <p>
            ПИБ: {COMPANY_INFO.pib} | МБ: {COMPANY_INFO.maticniBr}
          </p>
          <p>ЖР: {COMPANY_INFO.account}</p>
          <p className="text-xs text-gray-500">{COMPANY_INFO.bank}</p>
        </div>

        <Separator className="mx-4" />

        {/* Receipt meta */}
        <div className="px-4 py-2 space-y-0.5">
          <div className="flex justify-between">
            <span>Рачун бр:</span>
            <span className="font-bold">{receipt.number}</span>
          </div>
          <div className="flex justify-between">
            <span>Датум:</span>
            <span>{formatDateTimeSr(receipt.date)}</span>
          </div>
          <div className="flex justify-between">
            <span>Касир:</span>
            <span>{receipt.cashier}</span>
          </div>
          <div className="flex justify-between">
            <span>Плаћање:</span>
            <span className="uppercase">{receipt.paymentMethod}</span>
          </div>
        </div>

        <Separator className="mx-4" />

        {/* Items */}
        <div className="px-4 py-2">
          <div className="grid grid-cols-12 gap-1 font-bold text-xs border-b border-dashed border-gray-300 pb-1 mb-1">
            <span className="col-span-6">Артикал</span>
            <span className="col-span-2 text-right">Кол.</span>
            <span className="col-span-2 text-right">Цена</span>
            <span className="col-span-2 text-right">Износ</span>
          </div>
          {receipt.lines.map((line, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-1 py-0.5 border-b border-dotted border-gray-200"
            >
              <span className="col-span-6 truncate" title={line.productName}>
                {line.productName}
              </span>
              <span className="col-span-2 text-right">{line.quantity}</span>
              <span className="col-span-2 text-right">
                {line.unitPrice.toFixed(2)}
              </span>
              <span className="col-span-2 text-right">
                {line.totalAmount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="mx-4" />

        {/* PDV breakdown */}
        <div className="px-4 py-2">
          <p className="font-bold mb-1 text-xs">ПДВ обрачун:</p>
          {Object.entries(pdvLines).map(([rate, vals]) => (
            <div key={rate} className="flex justify-between text-xs">
              <span>ПДВ {rate}%</span>
              <span>
                {vals.base.toFixed(2)} + {vals.tax.toFixed(2)} ={" "}
                {(vals.base + vals.tax).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="mx-4" />

        {/* Totals */}
        <div className="px-4 py-2 space-y-1">
          <div className="flex justify-between">
            <span>Укупно:</span>
            <span className="font-bold">{formatRsd(receipt.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Плаћено:</span>
            <span>{formatRsd(receipt.paid)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-300 pt-1">
            <span>Кусур:</span>
            <span>{formatRsd(receipt.change)}</span>
          </div>
        </div>

        <Separator className="mx-4" />

        {/* Footer */}
        <div className="text-center px-4 py-4 space-y-1">
          <p className="text-xs text-gray-500">
            Фискални рачун је издат електронски
          </p>
          <p className="text-xs text-gray-500">Хвала на куповини!</p>
          <p className="text-xs text-gray-400 mt-2">
            =================================
          </p>
        </div>

        {/* Close button */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded border border-gray-300 text-xs font-medium hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Затвори
          </button>
          <button
            onClick={() => {
              window.print();
            }}
            className="flex-1 py-2 rounded bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Штампај
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// EMPTY STATE COMPONENT
// ================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">
        {description}
      </p>
      {action}
    </div>
  );
}

// ================================================================
// SHIFT SUMMARY CARD
// ================================================================

interface ShiftSummaryCardProps {
  isOpen: boolean;
  cashier: string;
  openedAt: string;
  totalSales: number;
  transactionCount: number;
  payments: {
    gotovina: number;
    kartica: number;
    tanjava: number;
    virman: number;
  };
}

export function ShiftSummaryCard({
  isOpen,
  cashier,
  openedAt,
  totalSales,
  transactionCount,
  payments,
}: ShiftSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Статус смее</CardTitle>
          <Badge
            className={
              isOpen
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
            }
          >
            {isOpen ? "● Отворена" : "● Затворена"}
          </Badge>
        </div>
        <CardDescription>
          Касир: {cashier} | Отворена: {formatDateTimeSr(openedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-xs text-muted-foreground">Готовина</p>
              <p className="font-semibold">{formatRsd(payments.gotovina)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Кирица</p>
              <p className="font-semibold">{formatRsd(payments.kartica)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-xs text-muted-foreground">Танрава</p>
              <p className="font-semibold">{formatRsd(payments.tanjava)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs text-muted-foreground">Вирман</p>
              <p className="font-semibold">{formatRsd(payments.virman)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Рачуна</p>
              <p className="font-semibold">{transactionCount}</p>
            </div>
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Укупна продаја:</span>
          <span className="text-lg font-bold text-emerald-600">
            {formatRsd(totalSales)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
