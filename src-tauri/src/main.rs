#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;

// 创立一个 Rust 命令
#[tauri::command]
fn close_splashscreen(window: tauri::Window) {
  // 敞开启动视图
  if let Some(splashscreen) = window.get_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  // 展现主视图4
  window.get_window("main").unwrap().show().unwrap();
}

use tauri::{ Menu, Submenu, MenuItem, CustomMenuItem };

fn main() {
  let submenu_gear = Submenu::new(
    "Gear",
    Menu::new()
      .add_native_item(MenuItem::Copy)
      .add_native_item(MenuItem::Paste)
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Zoom)
      .add_native_item(MenuItem::Separator)
      .add_native_item(MenuItem::Hide)
      .add_native_item(MenuItem::CloseWindow)
      .add_native_item(MenuItem::Quit),
  );
  let close = CustomMenuItem::new("close".to_string(), "Close");
  let quit = CustomMenuItem::new("quit".to_string(), "Quit");
  let submenu_customer = Submenu::new(
    "Customer", 
    Menu::new()
      .add_item(close)
      .add_item(quit)
    );
  let menus = Menu::new()
    .add_submenu(submenu_gear)
    .add_submenu(submenu_customer);

  tauri::Builder::default()
    // 增加菜单
    .menu(menus)
    // 监听自定义菜单事件
    .on_menu_event(|event| match event.menu_item_id() {
      "quit" => {
        std::process::exit(0);
      }
      "close" => {
        event.window().close().unwrap();
      }
      _ => {}
    })
    // 注册命令
    .invoke_handler(tauri::generate_handler![close_splashscreen])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}