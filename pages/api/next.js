export default function handler(req, res) {
  console.log("im in the api route");

  //const lastName = req.body.lastName;
  const { lastName, key } = req.body;

  res.status(200).json({ result: `Your last name is: ${lastName}` });
}
