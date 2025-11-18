"use client";

import { useState } from "react";
import { DarkThemeToggle } from "flowbite-react";

const GoogleIcon = () => {
  return (
    <svg
      height={20}
      width={20}
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2"
    >
      <g clipPath="url(#clip0_13183_10121)">
        <path
          d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z"
          fill="#3F83F8"
        ></path>
        <path
          d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z"
          fill="#34A853"
        ></path>
        <path
          d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z"
          fill="#FBBC04"
        ></path>
        <path
          d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z"
          fill="#EA4335"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_13183_10121">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(0.5)"
          ></rect>
        </clipPath>
      </defs>
    </svg>
  );
};

export default function Login() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Lấy authorization URL
      const response = await fetch("/api/gmail/auth");

      if (!response.ok) {
        throw new Error("Không thể kết nối đến server");
      }

      const data = await response.json();

      if (data.authUrl) {
        // Redirect đến Google OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error("Không thể lấy authorization URL");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      setIsConnecting(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <a
          href="#"
          className="mb-6 flex items-center text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img
            className="mr-2 h-8 w-8"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            alt="logo"
          />
          Rice Money
        </a>
        <div className="w-full rounded-lg bg-white shadow sm:max-w-md md:mt-0 xl:p-0 dark:border dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl leading-tight font-bold tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Sign in to your account
              </h1>
              <DarkThemeToggle />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="text-body bg-neutral-primary-soft border-default hover:text-heading focus:ring-neutral-tertiary-soft inline-flex w-full cursor-pointer items-center justify-center rounded-lg border px-4 py-2.5 text-center text-sm leading-5 font-medium shadow-xs hover:bg-gray-100 focus:ring-4 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:text-white hover:dark:bg-gray-400"
            >
              <GoogleIcon />
              {isConnecting ? "Đang kết nối..." : "Connect with Google"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
