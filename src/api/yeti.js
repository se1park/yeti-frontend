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

export async function proposeScheduleAdjust(scheduleId, body, token, userId) {
  try {
    return await request(`/api/schedules/${scheduleId}/adjust`, {
      method: 'POST',
      body,
      token,
    });
  } catch (error) {
    if (!userId || ![404, 405].includes(error?.status)) {
      throw error;
    }

    return request(`/api/schedules/${scheduleId}/participants/${userId}/adjust`, {
      method: 'POST',
      body,
      token,
    });
  }
}

export function parseSchedule(input, token) {
  return request('/api/schedules/parse', {
    method: 'POST',
    body: { input },
    token,
  });
}

export function parseVoiceSchedule(audio, token) {
  const body = new FormData();
  if (typeof Blob !== 'undefined' && audio instanceof Blob) {
    body.append('audio', audio, 'schedule-voice.webm');
  } else {
    body.append('audio', audio);
  }

  return request('/api/schedules/parse/voice', {
    method: 'POST',
    body,
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

export function leaveChatRoom(roomId, token) {
  return request(`/api/chat/rooms/${roomId}/leave`, {
    method: 'DELETE',
    token,
  });
}

export function searchUsers(q, token) {
  return request('/api/users/search', {
    method: 'GET',
    query: { q },
    token,
  });
}

export function getUserSettings(token) {
  return request('/api/users/settings', {
    method: 'GET',
    token,
  });
}

export function updateUserSettings(body, token) {
  return request('/api/users/settings', {
    method: 'PATCH',
    body,
    token,
  });
}

export function getNotifications(token, query = {}) {
  return request('/api/notifications', {
    method: 'GET',
    query,
    token,
  });
}

export function getUnreadNotificationCount(token) {
  return request('/api/notifications/unread-count', {
    method: 'GET',
    token,
  });
}

export function markNotificationRead(id, token) {
  return request(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    token,
  });
}

export function markAllNotificationsRead(token) {
  return request('/api/notifications/read-all', {
    method: 'PATCH',
    token,
  });
}

export function registerFcmToken(fcmToken, token) {
  return request('/api/auth/fcm-token', {
    method: 'PATCH',
    body: { fcmToken },
    token,
  });
}

export function getAdminDashboard(token) {
  return request('/admin/dashboard', {
    method: 'GET',
    token,
  });
}

export function getAdminUsers(token, query = {}) {
  return request('/admin/users', {
    method: 'GET',
    query,
    token,
  });
}

export function suspendAdminUser(id, token) {
  return request(`/admin/users/${id}/suspend`, {
    method: 'PATCH',
    token,
  });
}

export function activateAdminUser(id, token) {
  return request(`/admin/users/${id}/activate`, {
    method: 'PATCH',
    token,
  });
}

export function getAdminSchedules(token, query = {}) {
  return request('/admin/schedules', {
    method: 'GET',
    query,
    token,
  });
}

export function getAdminReports(token, query = {}) {
  return request('/admin/reports', {
    method: 'GET',
    query,
    token,
  });
}

export function reviewAdminReport(id, status, token) {
  return request(`/admin/reports/${id}/review`, {
    method: 'PATCH',
    body: { status },
    token,
  });
}

export function getAdminApiLogs(token, query = {}) {
  return request('/admin/logs/api', {
    method: 'GET',
    query,
    token,
  });
}

export function getAdminAiLogs(token, query = {}) {
  return request('/admin/logs/ai', {
    method: 'GET',
    query,
    token,
  });
}

export function getMaintenanceMode(token) {
  return request('/admin/system/maintenance', {
    method: 'GET',
    token,
  });
}

export function setMaintenanceMode(enabled, token) {
  return request('/admin/system/maintenance', {
    method: 'POST',
    query: { enabled },
    token,
  });
}

export function sendAdminEmail(body, token) {
  return request('/admin/notifications/email', {
    method: 'POST',
    body,
    token,
  });
}

export function sendAdminBroadcast(body, token) {
  return request('/admin/notifications/broadcast', {
    method: 'POST',
    body,
    token,
  });
}
