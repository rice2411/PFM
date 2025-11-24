"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth.services";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";

export function UserInfo() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  // Khởi tạo state trực tiếp từ localStorage (chạy ngay khi component khởi tạo)
  // Sử dụng function initializer để chỉ chạy 1 lần khi mount, trước khi render
  const [user, setUser] = useState<any | null>(() => {
    return AuthService.getUserFromStorage();
  });

  useEffect(() => {
    // Lắng nghe event để cập nhật khi user data thay đổi (ví dụ: refresh token)
    const handleUserUpdate = () => {
      const updatedUser = AuthService.getUserFromStorage();
      setUser(updatedUser);
    };

    // Custom event khi user được lưu trong cùng tab (quan trọng: refresh token, update profile)
    window.addEventListener("userUpdated", handleUserUpdate);
    
    // Storage event khi user đăng nhập ở tab khác (optional: nếu cần multi-tab sync)
    window.addEventListener("storage", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
      window.removeEventListener("storage", handleUserUpdate);
    };
  }, []);

  // Lấy thông tin user hoặc giá trị mặc định
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";
  
  const userEmail = user?.email || "";
  
  const userAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "/images/user/user-03.png";

  const handleLogout = async () => {
    // Đóng dropdown
    setIsOpen(false);

    try {
      // Gọi hàm logout từ AuthService
      await AuthService.logout();
      
      // Redirect về trang đăng nhập
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      // Vẫn redirect về trang đăng nhập dù có lỗi
      router.push("/auth/sign-in");
    }
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          <Image
            src={userAvatar}
            className="size-12 rounded-full"
            alt={`Avatar of ${userName}`}
            role="presentation"
            width={48}
            height={48}
          />
          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-dark-6 max-[1024px]:sr-only">
            <span>{userName}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <Image
            src={userAvatar}
            className="size-12 rounded-full"
            alt={`Avatar for ${userName}`}
            role="presentation"
            width={48}
            height={48}
          />

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-dark dark:text-white">
              {userName}
            </div>

            {userEmail && (
              <div className="leading-none text-gray-6">{userEmail}</div>
            )}
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6 [&>*]:cursor-pointer">
          <Link
            href={"/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <UserIcon />

            <span className="mr-auto text-base font-medium">View profile</span>
          </Link>

          <Link
            href={"/pages/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <SettingsIcon />

            <span className="mr-auto text-base font-medium">
              Account Settings
            </span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2 text-base text-[#4B5563] dark:text-dark-6">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark dark:hover:bg-dark-3 dark:hover:text-white"
            onClick={handleLogout}
          >
            <LogOutIcon />

            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
