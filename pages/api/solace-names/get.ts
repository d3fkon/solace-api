import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

/**
  * Get name/address of a given address/name with the guardian information
  */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  const client = await clientPromise;
  const db = client.db("solace-database")
  try {
    if (req.body.userName) {
      const user = await db.collection("users").findOne({
        userName: body.userName,
      });
      return res.status(200).json({ data: user });
    }
    if (req.body.address) {
      const user = await db.collection("users").findOne({
        address: body.address,
      });
      return res.status(200).json({ data: user });
    }
    else {
      return res.status(400).json({ error: "userName or address fields are required" });
    }
  }
  catch (e) {
    return res.status(400).json({ error: e });
  }
};

