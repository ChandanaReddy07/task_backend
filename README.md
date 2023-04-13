# task_backend
<h1 align="center">Social Media app💫</h1>
 A simple social media list app's backend with following features-

-   User authentication using JWT 
-   Contains endpoints which can add, delete posts and list all posts for a spfc. user ,follow als unfollow other user,like and comment on post

<br>



<h2>Tech-stack</h2>

-   Nodejs ,  Expressjs , MongoDB 

<br>


<h2>Endpoints</h2>

<table align="center">

<tr>

<th>Endpoints</th>

<th>Description</th>

</tr>

<tr>

<td>POST /api/authenticate</td>

<td>To perform user authentication and return a JWT token.</td>

</tr>

<tr>

<td>POST /api/follow/{id}</td>

<td>To make authenticated user would follow user with {id}</td>

</tr>

<tr>

<td>POST /api/unfollow/{id}</td>

<td>To make authenticated user would unfollow a user with {id}</td>

</tr>

<tr>

<td>GET /api/user</td>

<td>should authenticate the request and return the respective user profile.</td>

</tr>
<tr>

<td>POST /api/posts/</td>

<td>would add a new post created by the authenticated user.</td>

</tr>

<tr>

<td>DELETE /api/posts/</td>

<td>would delete post with {id} created by the authenticated user.</td>

</tr>
<tr>

<td>POST /api/like/{id}</td>

<td>would like the post with {id} by the authenticated user.</td>

</tr>
<tr>

<td>POST /api/unlike/{id}</td>

<td>would unlike the post with {id} by the authenticated user.</td>

</tr>
<tr>

<td>POST /api/comment/{id}</td>

<td>add comment for post with {id} by the authenticated user.</td>

</tr>
<tr>

<td>GET api/posts/{id}</td>

<td>would return a single post with {id} populated with its number of likes and comments.</td>

</tr>

<tr>

<td>GET /api/all_posts</td>

<td>would return all posts created by authenticated user sorted by post time.</td>

</tr>





</table>
<br>
