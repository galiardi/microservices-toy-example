const express = require('express');
const cors = require('cors');
const axios = require('axios');

const posts = {};

const handleEvent = (type, data) => {
  if (type === 'Post created') {
    const { id, title } = data;
    posts[id] = {
      id,
      title,
      comments: [],
    };
  }

  if (type === 'Comment created') {
    const { id, content, status, postId } = data;
    posts[postId]?.comments.push({ id, content, status });
  }

  if (type === 'Comment updated') {
    const { id, content, status, postId } = data;

    const post = posts[postId];
    const comment = post.comments.find((comment) => comment.id === id);

    comment.status = status;
    comment.content = content;
  }
};

const app = express();

app.use(express.json());
app.use(cors());

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log('Listening on port 4002');

  const response = await axios.get('http://localhost:4005/events');

  const events = response.data;

  for (let event of events) {
    console.log('Processing event: ', event.type);

    handleEvent(event.type, event.data);
  }
});
