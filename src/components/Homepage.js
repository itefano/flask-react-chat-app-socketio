import { useEffect, useState } from "react"


export default function Homepage()
{
    const [name, setName] = useState(localStorage.getItem('firstName'))
    return<h1>Welcome, {name}</h1>
}