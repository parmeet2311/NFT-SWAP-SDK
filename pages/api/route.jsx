import clientPromise from "../../connectors/mongodb";

import dbConnect from '../../connectors/mongodb'
import Orderbook from '../../connectors/schema'

export default async function handler (req, res) {
  const { method } = req

  await dbConnect()
  switch (method) {
    case 'GET':
      try {
        const orders = await Orderbook.find()
        res.status(200).json({ success: true, data: orders })
      } catch (error) {
        console.log(error)
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
     
      try {
        console.log(req.body)
        const order = await Orderbook.create(req.body)
        res.status(201).json({ success: true, data: order })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}