import express from 'express'; 

import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded());

const mongodbURL = "mongodb://127.0.0.1:27017/"
const mongoClient = new MongoClient(mongodbURL);

const connectDB = async () => {
	try {
		mongoClient.connect();
	} catch(err) {
		console.error("failed to start the db", err);
	}
}

const fetchData = async ({dbName, collectionName, query}) => {
	try {
		await connectDB();
		const db = mongoClient.db(dbName);
		const collection = db.collection(collectionName);
		const data = await collection.find(query).toArray();
		return data;
	} catch(err) {
		console.error(err);
		return null;
	}
}

const updateData = async ({dbName, collectionName, query, updateQuery}) => {
	try {
		await connectDB();
		const db = mongoClient.db(dbName);
		const collection= db.collection(collectionName);
		await collection.updateOne(query, updateQuery)
	} catch(err) {
		console.log("failed update the data");
		console.error(err);
	} finally {
	}
}

app.get('/', (_req, res) => {
  res.contentType = "html";
  res.send(
    `
    <a href='http://localhost:${port}/api/articles-list'
    >http://localhost:${port}/api/articles-list</a>
    `
  )
});

app.get('/api/articles-list', async (_req, res) => {
  res.send(await fetchData({
		dbName: "mock-blog",
  	collectionName: "articles",
		query: {}
	}));
});

app.get('/api/article/:id', async (req, res) => {
	res.send(await fetchData({
		dbName: "mock-blog",
		collectionName: "articles",
		query: {_id: ObjectId(req.params.id)}
	}));

	updateData({
		dbName: "mock-blog",
		collectionName: "articles",
		query: { _id: ObjectId(req.params.id) },
		updateQuery: {
			$inc: {
				views: 1
			}
		}
	})
});


app.listen(port, () => console.log(`The server is running on http://localhost:${port}`))
