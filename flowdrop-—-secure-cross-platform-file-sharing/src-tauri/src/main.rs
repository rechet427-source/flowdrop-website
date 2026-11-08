// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod transfer;

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

#[derive(Default)]
struct AppState {
    active_transfers_count: Mutex<usize>,
}

#[derive(Serialize, Deserialize)]
struct DeviceInfo {
    id: String,
    name: String,
    platform: String,
    ip: String,
}

#[tauri::command]
fn get_device_info() -> DeviceInfo {
    let hostname = hostname::get()
        .map(|h| h.to_string_lossy().to_string())
        .unwrap_or_else(|_| "FlowDrop-PC".to_string());

    let ip = local_ip_address::local_ip()
        .map(|i| i.to_string())
        .unwrap_or_else(|_| "127.0.0.1".to_string());

    #[cfg(target_os = "windows")]
    let platform = "windows".to_string();

    #[cfg(target_os = "android")]
    let platform = "android".to_string();

    #[cfg(not(any(target_os = "windows", target_os = "android")))]
    let platform = "unknown".to_string();

    DeviceInfo {
        id: format!("device-{}", &ip.replace('.', "-")),
        name: hostname,
        platform,
        ip,
    }
}

#[tauri::command]
fn get_disk_free_space(path: String) -> Result<u64, String> {
    #[cfg(windows)]
    {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;
        // On Windows, return simulated or Win32 GetDiskFreeSpaceExW
        Ok(64 * 1024 * 1024 * 1024) // 64 GB
    }

    #[cfg(not(windows))]
    {
        Ok(32 * 1024 * 1024 * 1024) // 32 GB
    }
}

fn main() {
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            get_device_info,
            get_disk_free_space
        ])
        .run(tauri::generate_context!())
        .expect("error while running FlowDrop Tauri application");
}
