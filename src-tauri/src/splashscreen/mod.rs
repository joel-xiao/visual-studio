use tauri::Manager;

// pub fn show_splashscreen(app: &mut tauri::App) {
//   let splashscreen_window = app.get_window("splashscreen").unwrap();
//   let main_window = app.get_window("main").unwrap();
//   // we perform the initialization code on a new task so the app doesn't freeze
//   tauri::async_runtime::spawn(async move {
//     // initialize your app here instead of sleeping :)
//     println!("Initializing...");
//     std::thread::sleep(std::time::Duration::from_secs(2));
//     println!("Done initializing.");

//     // After it's done, close the splashscreen and display the main window
//     splashscreen_window.close().unwrap();
//     main_window.show().unwrap();
//   });
// }

#[tauri::command]
pub fn close_splashscreen(window: tauri::Window) {
  // Open launch view
  if let Some(splashscreen) = window.get_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  // Display main view
  window.get_window("main").expect("no window labeled 'main' found").show().unwrap();
}