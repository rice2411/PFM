"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/currency";

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  bank: string;
  amount: number;
  balance: number;
  type: "income" | "expense";
}

interface TableProps {
  transactions?: Transaction[];
  accessToken?: string;
  maxResults?: number;
  query?: string;
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Sample data - sẽ được thay thế bằng data từ email
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date("2024-01-15T10:30:00"),
    description: "Thanh toán hóa đơn điện",
    bank: "Vietcombank",
    amount: -500000,
    balance: 7500000,
    type: "expense",
  },
  {
    id: "2",
    date: new Date("2024-01-14T14:20:00"),
    description: "Lương tháng 1/2024",
    bank: "Techcombank",
    amount: 10000000,
    balance: 8000000,
    type: "income",
  },
  {
    id: "3",
    date: new Date("2024-01-13T09:15:00"),
    description: "Mua sắm tại Coopmart",
    bank: "Vietcombank",
    amount: -250000,
    balance: -2000000,
    type: "expense",
  },
  {
    id: "4",
    date: new Date("2024-01-12T16:45:00"),
    description: "Chuyển khoản từ bạn bè",
    bank: "BIDV",
    amount: 500000,
    balance: -1750000,
    type: "income",
  },
];

export default function Table({
  transactions: propTransactions,
  accessToken: propAccessToken,
  maxResults = 50,
  query,
}: TableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    propTransactions || sampleTransactions
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGmailEmails = async () => {
      // Lấy access token từ props hoặc localStorage
      const token =
        propAccessToken || (typeof window !== "undefined" ? localStorage.getItem("gmail_access_token") : null);

      if (!token) {
        // Nếu không có token, sử dụng sample data
        setTransactions(sampleTransactions);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Gọi API để lấy danh sách email
        const params = new URLSearchParams({
          accessToken: token,
          maxResults: maxResults.toString(),
        });

        if (query) {
          params.append("query", query);
        }

        const response = await fetch(`/api/gmail/emails?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Không thể lấy danh sách email");
        }

        // Chuyển đổi transactions từ API response
        if (data.transactions && Array.isArray(data.transactions)) {
          // Chuyển đổi và sắp xếp theo ngày tăng dần (cũ nhất trước) để tính balance
          const sortedTransactions = data.transactions
            .map((t: any, index: number) => ({
              id: t.description + "-" + t.date + "-" + index,
              date: new Date(t.date),
              description: t.description,
              bank: t.bank,
              amount: t.amount,
              type: t.type,
            }))
            .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

          // Tính balance từ giao dịch cũ nhất đến mới nhất
          let currentBalance = 0;
          const transactionsWithBalance = sortedTransactions.map((t: any) => {
            currentBalance += t.amount;
            return {
              ...t,
              balance: currentBalance,
            };
          });

          // Sắp xếp lại theo ngày giảm dần (mới nhất trước) để hiển thị
          transactionsWithBalance.sort(
            (a, b) => b.date.getTime() - a.date.getTime()
          );

          setTransactions(transactionsWithBalance);
        } else {
          setTransactions(sampleTransactions);
        }
      } catch (err) {
        console.error("Error fetching Gmail emails:", err);
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        // Fallback về sample data nếu có lỗi
        setTransactions(sampleTransactions);
      } finally {
        setLoading(false);
      }
    };

    fetchGmailEmails();
  }, [propAccessToken, maxResults, query]);
  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800">
      {error && (
        <div className="m-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          {error}
        </div>
      )}
      {loading && (
        <div className="m-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Đang tải danh sách email từ Gmail...
        </div>
      )}
      <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
        <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-700 uppercase dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium sm:px-6">
              Ngày giờ
            </th>
            <th scope="col" className="px-4 py-3 font-medium sm:px-6">
              Nội dung
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 font-medium sm:table-cell sm:px-6"
            >
              Ngân hàng
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-medium sm:px-6"
            >
              Số tiền
            </th>
            <th
              scope="col"
              className="hidden px-4 py-3 text-right font-medium sm:px-6 lg:table-cell"
            >
              Số dư còn lại
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && !loading ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                Không có giao dịch nào
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <tr
                key={transaction.id}
                className={`border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${
                  index === transactions.length - 1 ? "" : ""
                }`}
              >
                <td className="px-4 py-4 whitespace-nowrap text-gray-900 sm:px-6 dark:text-gray-300">
                  <div className="text-xs sm:text-sm">
                    {formatDate(transaction.date)}
                  </div>
                </td>
                <td className="px-4 py-4 font-medium text-gray-900 sm:px-6 dark:text-white">
                  <div className="max-w-xs truncate sm:max-w-md">
                    {transaction.description}
                  </div>
                </td>
                <td className="hidden px-4 py-4 whitespace-nowrap text-gray-600 sm:table-cell sm:px-6 dark:text-gray-400">
                  {transaction.bank}
                </td>
                <td
                  className={`px-4 py-4 text-right font-semibold whitespace-nowrap sm:px-6 ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "income" ? "+" : ""}
                  {formatCurrency(Math.abs(transaction.amount))}
                </td>
                <td className="hidden px-4 py-4 text-right font-medium whitespace-nowrap text-gray-900 sm:px-6 lg:table-cell dark:text-gray-300">
                  {formatCurrency(transaction.balance)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
