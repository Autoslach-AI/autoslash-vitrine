import React from "react";
import { RecentCustomerRow } from "./schema";
import { Badge } from "@/components/ui/badge";

export function RecentCustomersTable({ data }: { data: RecentCustomerRow[] }) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-black/40">
            <th className="h-10 px-2 text-left font-medium">Customer</th>
            <th className="h-10 px-2 text-left font-medium">Plan</th>
            <th className="h-10 px-2 text-left font-medium">Billing</th>
            <th className="h-10 px-2 text-left font-medium">Status</th>
            <th className="h-10 px-2 text-right font-medium">Signup Date</th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.map((row) => (
            <tr key={row.id} className="border-b transition-colors hover:bg-black/5">
              <td className="p-2">
                <div className="font-medium text-black">{row.name}</div>
                <div className="text-[10px] text-black/40">{row.email}</div>
              </td>
              <td className="p-2 text-black/60">{row.plan}</td>
              <td className="p-2 text-black/60">{row.billing}</td>
              <td className="p-2">
                <Badge variant={row.status === "Active" ? "default" : "secondary"}>
                  {row.status}
                </Badge>
              </td>
              <td className="p-2 text-right text-black/60">
                {new Date(row.signupDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
