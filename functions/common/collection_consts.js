// App Constants for collections
const users = 'users';
const posts = 'posts';
const usersReport = 'usersReport';
const postsReport = 'postsReport';
const fcmTokens = 'fcmTokens';
const activities = 'activities';
const flaggedPosts = 'flaggedPosts';

/// Array of `users` collections String
const usersSubCollections = [
  "blockedUsers",
  "chatRooms",

]


module.exports = {
  users,
  posts,
  fcmTokens,
  usersReport,
  postsReport,
  usersSubCollections,
  activities,
  flaggedPosts
}