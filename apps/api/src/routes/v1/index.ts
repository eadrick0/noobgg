import { Hono } from "hono";
import distributorsRoutes from "./distributors";
import eventAttendeesRouter from "./event-attendees";
import eventInvitationsRouter from "./event-invitations";
import eventsRouter from "./events";
import gameModesRoutes from "./game-modes";
import gameRanksRoutes from "./game-ranks";
import gamesRoutes from "./games";
import languagesRouter from "./languages";
import lobbiesRoutes from "./lobbies";
import platformsRoutes from "./platforms";
import userProfilesRoutes from "./user-profiles";
import achievementsRoutes from "./achievements";
import lobbyMembersRoutes from "./lobby-members";

const v1Router = new Hono();

v1Router.route("/games", gamesRoutes);
v1Router.route("/game-modes", gameModesRoutes);
v1Router.route("/platforms", platformsRoutes);
v1Router.route("/distributors", distributorsRoutes);
v1Router.route("/game-ranks", gameRanksRoutes);
v1Router.route("/user-profiles", userProfilesRoutes);
v1Router.route("/event-attendees", eventAttendeesRouter);
v1Router.route("/event-invitations", eventInvitationsRouter);
v1Router.route("/events", eventsRouter);
v1Router.route('/languages', languagesRouter);
v1Router.route('/lobbies', lobbiesRoutes);
v1Router.route('/achievements', achievementsRoutes);
v1Router.route('/lobby-members', lobbyMembersRoutes);

export default v1Router;

