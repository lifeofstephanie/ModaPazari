"use client";

import {
  CameraIcon,
  CheckCheckIcon,
  InfoIcon,
  //   Key,
  KeyIcon,
  MailIcon,
  User2Icon,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="grid grid-cols-2 max-md:grid-cols-1 bg-linear-to-b from-[#e0ebf6] to-white min-h-screen">
      <div className="flex flex-col gap-3 p-3">
        <div className="bg-white shadow-md rounded-xl  mt-5">
          <p className="p-5 border-b border-b-[#ccc]/50">Profile Settings</p>
          <div className="p-5">
            <div className="flex flex-col gap-3 justify-center items-center">
              <div className="w-20 h-20 rounded-full bg-[#666]  flex justify-center items-center relative">
                <div className="w-5 h-5 rounded-full absolute right-1 top-0 bg-white text-[#7A2048] flex justify-center items-center cursor-pointer">
                  <CameraIcon size={16} />
                </div>
                <User2Icon size={30} />
              </div>
              <p className="font-bold text-red-500 cursor-pointer">
                Remove Photo
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-5 justify-center my-3">
                <div className="flex flex-col gap-2 ">
                  <label>First Name</label>
                  <input
                    placeholder="first name"
                    className=" h-10 border border-[#ccc] rounded-md px-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2 ">
                  <label>Last Name</label>
                  <input
                    placeholder="last name"
                    className=" h-10 border border-[#ccc] rounded-md px-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 my-3 ">
                <label htmlFor="">Business Name</label>
                <input
                  placeholder="business name"
                  className=" h-10 border border-[#ccc] rounded-md px-2 text-sm"
                />
              </div>
              <div className="my-3">
                <div className="flex flex-col gap-2 ">
                  <label>Phone Number</label>
                  <div className="grid grid-cols-2 gap-3 justify-center">
                    <input
                      placeholder="phone number"
                      className=" h-10 border border-[#ccc] rounded-md px-2 text-sm"
                    />
                    <div className="flex flex-row gap-5 justify-end items-center ">
                      <CheckCheckIcon color="green" />
                      <p>Verified</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="my-3">
                <div className="flex flex-col gap-2 ">
                  <label>Email</label>
                  <div className="grid grid-cols-2 gap-3 justify-center">
                    <input
                      placeholder="stephanieworkprojects@gmail.com"
                      className=" h-10 border border-[#ccc] rounded-md px-2 bg-[#ccc] cursor-not-allowed text-sm"
                    />
                    <div className="w-fit flex flex-row gap-3 justify-end items-center border p-1 rounded-md border-[#ccc] ml-auto ">
                      <MailIcon size={16} />
                      <p className="text-sm">Change Email</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-3">
        <div className="bg-white shadow-md rounded-xl  mt-5">
          <p className="p-5 border-b border-b-[#ccc]/50">
            Notification Settings
          </p>
          <div className="p-5 flex flex-col gap-5">
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">Notification Channels</p>
                  <InfoIcon
                    size={16}
                    className="inline-block ml-1 text-[#ccc]"
                  />
                </div>
                <p className="text-[#666]/50 text-sm italic">Email & SMS</p>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${enabled ? "bg-indigo-500" : "bg-gray-300"}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${enabled ? "translate-x-6" : ""}`}
                />
              </button>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">Push Notifications</p>
                {/* <InfoIcon
                    size={16}
                    className="inline-block ml-1 text-[#ccc]"
                  /> */}
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${enabled ? "bg-indigo-500" : "bg-gray-300"}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${enabled ? "translate-x-6" : ""}`}
                />
              </button>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">Messages</p>
                {/* <InfoIcon
                    size={16}
                    className="inline-block ml-1 text-[#ccc]"
                  /> */}
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${enabled ? "bg-indigo-500" : "bg-gray-300"}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${enabled ? "translate-x-6" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl  mt-5">
          <p className="p-5 border-b border-b-[#ccc]/50">Account Settings</p>
          <div className="p-5 flex flex-col gap-5">
            <div className="flex justify-between">
              <p className="text-sm font-bold">Password</p>
              <div className="flex gap-2 border w-fit p-1 rounded-md text-sm border-[#ccc] text-[#666] cursor-pointer ">
                <KeyIcon size={15} />
                <p>Change Password</p>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">Two-Factor Authentication</p>
                <InfoIcon size={16} className="inline-block ml-1 text-[#ccc]" />
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${enabled ? "bg-indigo-500" : "bg-gray-300"}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${enabled ? "translate-x-6" : ""}`}
                />
              </button>
            </div>
            <div className="mt-5 flex justify-between items-center">
              <p className="text-sm font-bold">Danger Zone</p>
              <p className="text-sm text-red-500 cursor-pointer font-bold">
                Delete Account
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl  mt-5 p-5 flex flex-col md:flex-row max-md:gap-5 md:justify-between md:items-center ">
          <div>
            <p className="font-bold text-sm">
              Confirm to apply the new settings
            </p>
            <p className="text-[#666]/60 mt-2 text-xs">
              Please review your information before submitting
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="border border-[#ccc] rounded-md text-[#666] text-sm px-5 py-2 flex justify-center items-center">
              <p>Cancel</p>
            </div>
            <div className="border  rounded-md text-white text-sm px-5 py-2 bg-[#7A2048] flex justify-center items-center">
              <p>Submit</p>
            </div>
            {/* <div></div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
