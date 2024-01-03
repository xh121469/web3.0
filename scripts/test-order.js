/*
 * @作者: kerwin
 */
const KerwinToken = artifacts.require("KerwinToken.sol")
const Exchange = artifacts.require("Exchange.sol")
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // 0x 后面 40 个 0


const fromWei = (bn) => {
    return web3.utils.fromWei(bn, "ether");
}

const toWei = (number) => {
    return web3.utils.toWei(number.toString(), "ether");
}

const wait = (seconds) => {
    const milliseconds = seconds * 1000
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}


module.exports = async function (callback) {
    try {
        const kerwintoken = await KerwinToken.deployed()
        const exchange = await Exchange.deployed()
        const accounts = await web3.eth.getAccounts()

        //第一步account0---->account1 10w
        await kerwintoken.transfer(accounts[1], toWei(100000), {
            from: accounts[0]
        })
        await wait(1)
        //第二步account0 ---》交易所存入  10以太币
        await exchange.depositEther({
            from: accounts[0],
            value: toWei(100)
        })
        let res1 = await exchange.tokens(ETHER_ADDRESS, accounts[0])
        console.log("account[0]-在交易所的以太币", fromWei(res1))
        await wait(1)
        //第二步account0 ---》交易所存入  100000KWT
        await kerwintoken.approve(exchange.address, toWei(100000), {
            from: accounts[0]
        })
        await exchange.depositToken(kerwintoken.address, toWei(100000), {
            from: accounts[0]
        })
        await wait(1)
        let res2 = await exchange.tokens(kerwintoken.address, accounts[0])
        console.log("account[0]-在交易所的KWT", fromWei(res2))

        await wait(1)
        //第三步account1 ---》交易所存入  5以太币
        await exchange.depositEther({
            from: accounts[1],
            value: toWei(50)
        })
        let res3 = await exchange.tokens(ETHER_ADDRESS, accounts[1])
        console.log("account[1]-在交易所的以太币", fromWei(res3))
        await wait(1)
        //第三步account1 ---》交易所存入  50000KWT
        await kerwintoken.approve(exchange.address, toWei(50000), {
            from: accounts[1]
        })
        await exchange.depositToken(kerwintoken.address, toWei(50000), {
            from: accounts[1]
        })
        await wait(1)
        let res4 = await exchange.tokens(kerwintoken.address, accounts[1])
        console.log("account[1]-在交易所的KWT", fromWei(res4))

        let orderId = 0;
        let res;

        //创建订单
        res = await exchange.makeOrder(kerwintoken.address, toWei(1000), ETHER_ADDRESS, toWei(0.1), { from: accounts[0] });

        orderId = res.logs[0].args.id
        console.log("创建一个订单")
        await wait(1)
        //取消订单
        res = await exchange.makeOrder(kerwintoken.address, toWei(2000), ETHER_ADDRESS, toWei(0.2), { from: accounts[0] });

        orderId = res.logs[0].args.id

        await exchange.cancelOrder(orderId, { from: accounts[0] })
        console.log("取消一个订单")
        await wait(1)
        //完成订单
        res = await exchange.makeOrder(kerwintoken.address, toWei(3000), ETHER_ADDRESS, toWei(0.3), { from: accounts[0] });

        orderId = res.logs[0].args.id

        await exchange.fillOrder(orderId, { from: accounts[1] })
        console.log("完成一个订单")



        console.log("account[0]-在交易所的KWT", fromWei(await exchange.tokens(kerwintoken.address, accounts[0])))
        console.log("account[0]-在交易所的以太币", fromWei(await exchange.tokens(ETHER_ADDRESS, accounts[0])))

        console.log("account[1]-在交易所的KWT", fromWei(await exchange.tokens(kerwintoken.address, accounts[1])))
        console.log("account[1]-在交易所的以太币", fromWei(await exchange.tokens(ETHER_ADDRESS, accounts[1])))
    } catch (error) {
        console.log(error)
    }
    // console.log("account[2]-在交易所的KWT",fromWei(await exchange.tokens(kerwintoken.address,accounts[2])))

    callback()
}