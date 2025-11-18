"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/currency";
import Pagination from "./pagination";

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

export default function Table({
  transactions: propTransactions,
  accessToken: propAccessToken,
  maxResults = 50,
  query,
}: TableProps) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(
    propTransactions || [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const transactions = allTransactions.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchAllGmailEmails = async () => {
      if (typeof window === "undefined") return;

      const accessToken =
        propAccessToken || localStorage.getItem("gmail_access_token");
      const refreshToken = localStorage.getItem("gmail_refresh_token");

      if (!accessToken && !refreshToken) {
        setAllTransactions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          fetchAll: "true",
        });

        if (accessToken) {
          params.append("accessToken", accessToken);
        }
        if (refreshToken) {
          params.append("refreshToken", refreshToken);
        }

        if (query) {
          params.append("query", query);
        }

        const response = await fetch(`/api/gmail/emails?${params.toString()}`);
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
          if (response.status === 401 && refreshToken && !propAccessToken) {
            try {
              const refreshResponse = await fetch("/api/gmail/refresh", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken }),
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                const newAccessToken = refreshData.accessToken;
                localStorage.setItem("gmail_access_token", newAccessToken);

                params.set("accessToken", newAccessToken);
                params.delete("refreshToken");
                const retryResponse = await fetch(
                  `/api/gmail/emails?${params.toString()}`,
                );
                const retryData = await retryResponse.json();

                if (retryResponse.ok) {
                  processTransactions(retryData);
                  return;
                }
              }
            } catch (refreshError) {
              console.error("Error refreshing token:", refreshError);
            }
          }

          throw new Error(data.error || "Không thể lấy danh sách email");
        }

        if (data.accessToken && !propAccessToken) {
          localStorage.setItem("gmail_access_token", data.accessToken);
        }

        processTransactions(data);
      } catch (err) {
        console.error("Error fetching Gmail emails:", err);
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        setAllTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    const processTransactions = (data: any) => {
      if (data.transactions && Array.isArray(data.transactions)) {
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

        let currentBalance = 0;
        const transactionsWithBalance = sortedTransactions.map((t: any) => {
          currentBalance += t.amount;
          return {
            ...t,
            balance: currentBalance,
          };
        });

        transactionsWithBalance.sort(
          (a: Transaction, b: Transaction) =>
            b.date.getTime() - a.date.getTime(),
        );

        setAllTransactions(transactionsWithBalance);
      } else {
        setAllTransactions([]);
      }
    };

    fetchAllGmailEmails();
  }, [propAccessToken, query, maxResults]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, maxResults]);
  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-xs dark:border-gray-700 dark:bg-gray-800">
      {error && (
        <div className="m-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {loading && (
        <div className="m-4 flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đang tải danh sách email từ Gmail...
            </p>
          </div>
        </div>
      )}
      {!loading && allTransactions.length === 0 && !error && (
        <div className="m-4 flex items-center justify-center py-12">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Không có giao dịch nào
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Chưa có email giao dịch nào được tìm thấy. Hãy kiểm tra lại kết
              nối Gmail hoặc thử lại sau.
            </p>
          </div>
        </div>
      )}
      {!loading && allTransactions.length > 0 && (
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
            {transactions.map((transaction, index) => (
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
            ))}
          </tbody>
        </table>
      )}
      {!loading && allTransactions.length > 0 && (
        <Pagination
          totalItems={allTransactions.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            // window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          hasNextPage={false}
        />
      )}
    </div>
  );
}
