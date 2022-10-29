import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { customAlphabet } from 'nanoid';
import { sendEmail } from "../../../lib/utils/email";

/**
  * Request Body 
  *   {
  *     resendOtp: boolean,
  *     email: string,
  *     userName: string,
  *   }
  */
export default async function(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body; const email = body.email;
  const isValid = isEmailValid(email);
  if (!isValid) {
    return res.status(400).json({
      error: "Invalid Email"
    })
  }
  const client = await clientPromise;
  const db = client.db("solace-database")
  const user = await db.collection("users").findOne({
    $or: [
      {
        email: body.email,
      },
      {
        userName: body.userName,
      }
    ]
  });
  if (user && !body.resendOtp) {
    return res.status(400).json({
      error: "`email` or `userName` already in use"
    })
  }

  if (body.resendOtp && (!user || user.isEmailVerified)) {
    return res.status(400).json({
      error: "incorrect use of `resendOtp`"
    })
  }

  const otp = customAlphabet('1234567890', 5)();

  if (body.resendOtp) {
    await db.collection("email-otp").insertOne({
      email: body.email,
      otp,
    })
  }
  else {
    await db.collection("email-otp").findOneAndUpdate({
      email: body.email,
    }, {
      otp,
    })
  }

  await sendEmail({
    email: body.email as string,
    subject: "OTP: Here's your OTP for Solace",
    html: `Your OTP for logging into Solace - ${otp}`
  })

  if (!body.resendOtp)
    await db.collection("users").insertOne({
      userName: body.userName,
      isEmailVerified: false,
      email: body.email,
    })
  return res.status(200).json({ success: true })
}


var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

function isEmailValid(email: string) {
  if (!email)
    return false;

  if (email.length > 254)
    return false;

  var valid = emailRegex.test(email);
  if (!valid)
    return false;

  // Further checking of some things regex can't handle
  var parts = email.split("@");
  if (parts[0].length > 64)
    return false;

  var domainParts = parts[1].split(".");
  if (domainParts.some(function(part) { return part.length > 63; }))
    return false;

  return true;
}
