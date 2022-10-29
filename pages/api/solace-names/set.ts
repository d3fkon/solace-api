import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  const client = await clientPromise;
  const db = client.db("solace-database")
  try {
    await db.collection("users").findOneAndUpdate({
      userName: body.userName,
    }, {
      address: body.address
    })
  }
  catch (e) {
    console.log(e)
    return res.status(400).json({ error: e });
  }
  res.status(200).json({ record: "added" });
};

