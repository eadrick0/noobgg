import { Hono } from 'hono';
import {
  joinLobbyController,
  getLobbyMembersController,
  leaveLobbyController
} from '../../controllers/v1/lobby-members.controller';

const lobbyMembers = new Hono();

// Join a lobby
lobbyMembers.post('/join', joinLobbyController);

// Get lobby members
lobbyMembers.get('/lobby/:lobbyId', getLobbyMembersController);

// Leave a lobby
lobbyMembers.post('/leave', leaveLobbyController);

export default lobbyMembers;