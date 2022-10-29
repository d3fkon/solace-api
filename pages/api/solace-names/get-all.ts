/***
  * Endpoint to accept an array of address / names and return back the supplimentary information for the same
  * */

import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  const client = await clientPromise;
  const db = client.db("solace-database")
  try {
    let query;
    if (body.userNames) {
      query = {
        'userName': {
          $in: body.userNames
        }
      }
    }
    else if (body.addresses) {
      query = {
        'address': {
          $in: body.addresses
        }
      }
    }
    else {
      return res.status(400).json({ error: "'userNames' or 'addresses' fields is required" });
    }

    const cursor = db.collection("users").find(query);
    const data: any = [];
    await cursor.forEach((user) => {
      data.push(user);
    })
    return res.status(200).json({ data })
  }
  catch (e) {
    return res.status(400).json({ error: e });
  }
};
