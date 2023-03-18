
// models/User.js

import mongoose from 'mongoose'
import { string } from 'yup'

const OrderSchema = new mongoose.Schema(
    {
        erc20Token: String,
        erc20TokenAmount: String,
        nftToken: String,
        nftTokenId: String,
        nftTokenAmount: String,
        nftType: String,
        sellOrBuyNft: String,
        chainId: String,
        order: {
            direction: String,
            erc20Token: String,
            erc20TokenAmount: String,
            erc721Token: String,
            erc721TokenId: String,
            erc721TokenProperties: Array,
            expiry: String,
            fees: Array,
            maker: String,
            nonce: String,
            signature: {
                r: String,
                s: String,
                v: Number,
                signatureType: Number,

            },
            taker: String
        },
        orderStatus: {
            status: String,
            transactionHash: String,
            blockNumber: String
        },
        metadata: {}
    }
)

module.exports = mongoose.models.Orderbook || mongoose.model('Orderbook', OrderSchema)