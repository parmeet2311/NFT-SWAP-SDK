import React from 'react'

const Orders = (props) => {
    return (
        <div>
            <h1>ORDERS</h1>
            <ul className='list-none'>
                {
                    props.data.map(content => (
                        <li>
                            
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}

export default Orders