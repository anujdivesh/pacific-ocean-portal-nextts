'use client'
import React from 'react'
import { Container } from 'react-bootstrap'
import { usePathname } from 'next/navigation';

const Aboutus = () => {
    const pathname = usePathname();
    return (
        <>
            <Container>
            <h2 className='text-center mt-2'>
            Experts
            </h2>
            </Container>
       
        </>
       
    )
}

export default Aboutus