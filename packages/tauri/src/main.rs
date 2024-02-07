#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod splashscreen;
mod menu;

fn main() {
  tauri::Builder::default()
    // .setup(|app| Ok(splashscreen::show_splashscreen(app)))
    .menu(menu::new())
    .on_menu_event(|event| menu::on_event(event))
    .invoke_handler(tauri::generate_handler![splashscreen::close_splashscreen])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}