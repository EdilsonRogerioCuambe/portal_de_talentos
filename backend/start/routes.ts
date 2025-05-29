/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.post("/register", "AuthController.register");
  Route.post("/login", "AuthController.login");

  Route.post("/test-email", "AuthController.testEmail");
}).prefix("/auth");

Route.get("/skills", "SkillController.index");
Route.get("/cep/:cep", "UserController.getCepData");

Route.group(() => {
  Route.get("/me", "AuthController.me");
  Route.post("/logout", "AuthController.logout");

  Route.get("/profile", "UserController.profile");
  Route.put("/manager-profile", "UserController.updateProfile");
  Route.put("/candidate-profile", "UserController.updateProfile");
  Route.delete("/profile", "UserController.deleteAccount");

  Route.group(() => {
    Route.get("/candidates", "ManagerController.listCandidates");
    Route.get("/candidates/:id", "ManagerController.showCandidate");
    Route.post('/candidates/:id/schedule-interview', 'ManagerController.scheduleInterview');
    Route.put('/candidates/:id/reschedule-interview', 'ManagerController.rescheduleInterview');
    Route.delete('/candidates/:id/cancel-interview', 'ManagerController.cancelInterview');
  }).middleware(["role:manager"]);
}).middleware(["auth:api"]);
