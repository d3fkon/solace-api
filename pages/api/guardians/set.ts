import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

/**
  *
  * req.body = {
  *   "userName": "string",
  *   "guardian": "string" // Public Key
  * }
  *
  * or
  *
  * req.body = {
  *   "address": "string", // Public Key
  *   "guardian": "string" // Public Key
  * }
  *
  * 
  **/
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  const client = await clientPromise;
  const db = client.db("solace-database")
  let user: any;

  if (req.body.userName) {
    user = await db.collection("users").findOne({
      userName: body.userName,
    });
  }
  if (req.body.address) {
    user = await db.collection("users").findOne({
      address: body.address,
    });
  }
  if (!user) {
    return res.status(400).json({ error: "userName or address invalid" })
  }
  if (!req.body.guardian) {
    return res.status(400).json({ error: "guardian address not provided" })
  }
  try {
    await db.collection("users").findOneAndUpdate({
      userName: user.userName,
    }, {
      $push: {
        guardians: req.body.guardian
      }
      // guardians: user.guardians ? {
      //   $push: req.body.guardian
      // } : [req.body.guardian]
    })
  }
  catch (e) {
    console.log(e)
    return res.status(400).json({ error: e });
  }
  res.status(200).json({ record: "guardian added" });
};
