import { Configuration, OpenAIApi } from "openai";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const configuration = new Configuration({
  organization: "org-OqXxaHHtx4RLvFS592zWYq9r",
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

app.post("/", async(req, res) => {
  const { message } = req.body;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {role: "user", content: `${message}`},
    ]
  });

  res.json({
    completion: completion.data.choices[0].message,
  })
})

app.listen(port, () => {
  console.log("app running on port", port);
})
