import { useEffect, useState } from "react"
import Card from 'react-bootstrap/Card';
import 'bootstrap/dist/css/bootstrap.min.css';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Container from 'react-bootstrap/Container';

export default function Orderbook() {
    const [orders, setOrders]=useState([])
    const [filterOrder, setFilterOrder] = useState(orders)

    const getOrderData = async () => {
        
        const options = { method: 'GET', headers: { accept: 'application/json', 'X-API-Key': 'test' } };

        fetch('https://api.trader.xyz/orderbook/orders', options)
            .then(response => response.json())
            .then(response=> {

                console.log(response.orders)
                setOrders(response.orders)
               
            })
            .catch(err => console.error(err));

    };
    function handleFilter(nftType){
        console.log(nftType);
        const filterByNftType= orders.filter(index=> index.nftType===`${nftType}`)
        console.log(filterByNftType);
        setFilterOrder(filterByNftType)
        console.log(filterOrder)
    }

    useEffect(() => {
        getOrderData();
    }, [])

    return (
        <div class="text-center m-8">
            <h1>ORderbook</h1>
            <div>
                <DropdownButton
                    id="dropdown-button-dark-example2"
                    variant="secondary"
                    menuVariant="dark"
                    title="Select NFT Type"
                    className="mt-2 text-left"
                >
                   
                    <Dropdown.Item onClick={()=>handleFilter("ERC20")}>ERC-20</Dropdown.Item>
                    <Dropdown.Item onClick={()=>handleFilter("ERC721")}>ERC-721</Dropdown.Item>
                    <Dropdown.Item onClick={()=>handleFilter("ERC1155")}>ERC-1155</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={()=>setFilterOrder(orders)}>All</Dropdown.Item>
                    
                </DropdownButton>

                <Container class="my-4 inline-flex flex-wrap">
                    {filterOrder.filter(index=> index.sellOrBuyNft==="sell").map(nft=>(
                        <Card style={{ width: '20rem', margin:'10px' }}>
                        <Card.Body>
                            <Card.Title>{nft.nftType}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{nft.nftTokenAmount}eth</Card.Subtitle>
                            <Card.Text class="text-left mb-2">
                               
                                    <li>erc20Token: {nft.erc20Token}</li>
                                    <li>erc20TokenAmount: {nft.erc20TokenAmount}</li>
                                    
                                    <li>nftToken: {nft.nftToken}</li>
                                    <li>nftTokenId: {nft.nftTokenId}</li>
                                    <li>chainId: {nft.chainId}</li>
                                
                            </Card.Text>
                            
                        </Card.Body>
                    </Card>

                    ))}
                    
                </Container>
            </div>
        </div>
    )
}
