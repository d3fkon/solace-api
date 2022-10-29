import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";


// Check if a username is available
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  const client = await clientPromise;
  const db = client.db("solace-database");
  const user = await db.collection("users").findOne({
    userName: body.userName,
  });
  if (!user) {
    return res.status(200).json({ status: "OK" });
  }
  return res.status(400).json({ error: "Username Taken" });
}
