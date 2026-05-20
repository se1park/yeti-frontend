import { request } from './auth';

export function getSchedules(token, filters = {}) {
  return request('/api/schedules', {
    method: 'GET',
    token,
    query: filters,
  });
}

export function getSchedule(scheduleId, token) {
  return request(`/api/schedules/${scheduleId}`, {
    method: 'GET',
    token,
  });
}

export function getScheduleInvitations(token) {
  return request('/api/schedules/invitations', {
    method: 'GET',
    token,
  });
}

export function createSchedule(body, token) {
  return request('/api/schedules', {
    method: 'POST',
    body,
    token,
  });
}

export function updateSchedule(scheduleId, body, token) {
  return request(`/api/schedules/${scheduleId}`, {
    method: 'PATCH',
    body,
    token,
  });
}

export function deleteSchedule(scheduleId, token) {
  return request(`/api/schedules/${scheduleId}`, {
    method: 'DELETE',
    token,
  });
}

export function completeSchedule(scheduleId, token) {
  return request(`/api/schedules/${scheduleId}/complete`, {
    method: 'PATCH',
    token,
  });
}

export function respondToInvitation(scheduleId, action, token) {
  return request(`/api/schedules/${scheduleId}/respond`, {
    method: 'PATCH',
    body: { action },
    token,
  });
}

export function proposeScheduleAdjust(scheduleId, userId, body, token) {
  return request(`/api/schedules/${scheduleId}/participants/${userId}/adjust`, {
    method: 'POST',
    body,
    token,
  });
}

export function parseSchedule(input, token) {
  return request('/api/schedules/parse', {
    method: 'POST',
    body: { input },
    token,
  });
}

export function getFriends(token) {
  return request('/api/friends', {
    method: 'GET',
    token,
  });
}

export function getFriendRequests(token) {
  return request('/api/friends/requests', {
    method: 'GET',
    token,
  });
}

export function sendFriendRequest(username, token) {
  return request('/api/friends/request', {
    method: 'POST',
    body: { username },
    token,
  });
}

export function acceptFriendRequest(friendshipId, token) {
  return request(`/api/friends/${friendshipId}/accept`, {
    method: 'PATCH',
    token,
  });
}

export function rejectFriendRequest(friendshipId, token) {
  return request(`/api/friends/${friendshipId}/reject`, {
    method: 'PATCH',
    token,
  });
}

export function deleteFriend(friendshipId, token) {
  return request(`/api/friends/${friendshipId}`, {
    method: 'DELETE',
    token,
  });
}

export function blockUser(friendshipId, token) {
  return request(`/api/friends/${friendshipId}/block`, {
    method: 'POST',
    token,
  });
}

export function createStudyNote(body, token) {
  return request('/api/study-notes', {
    method: 'POST',
    body,
    token,
  });
}

export function summarizeStudyNote(noteId, token) {
  return request(`/api/study-notes/${noteId}/summarize`, {
    method: 'POST',
    token,
  });
}

export function getStudyNotes(scheduleId, token) {
  return request(`/api/study-notes/${scheduleId}`, {
    method: 'GET',
    token,
  });
}

export function getChatRooms(token) {
  return request('/api/chat/rooms', {
    method: 'GET',
    token,
  });
}

export function createChatRoom(body, token) {
  return request('/api/chat/rooms', {
    method: 'POST',
    body,
    token,
  });
}

export function getChatMessages(roomId, token, query = {}) {
  return request(`/api/chat/rooms/${roomId}/messages`, {
    method: 'GET',
    query,
    token,
  });
}

export function getChatMediaUploadUrl(roomId, body, token) {
  return request(`/api/chat/rooms/${roomId}/media`, {
    method: 'POST',
    body,
    token,
  });
}

export function reactToChatMessage(messageId, emoji, token) {
  return request(`/api/chat/messages/${messageId}/react`, {
    method: 'PATCH',
    body: { emoji },
    token,
  });
}

export function deleteChatMessage(messageId, token) {
  return request(`/api/chat/messages/${messageId}`, {
    method: 'DELETE',
    token,
  });
}
