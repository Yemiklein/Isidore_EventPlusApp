import React, { useState, useEffect, useContext } from 'react'
import "./style.css"
import EventCard from "../components/EventCard"
import FormContainer from "../components/FormContainer"
import Tools from '../components/Tools'
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_BOOKED_EVENTS, GET_EVENTS, GET_USER } from '../queries/Queries';
import { AppContext } from '../utils/AppContext'

const Events = () => {

    const [selected, setSelected] = useState({value: "All"})
    const [userEvents, setUserEvents] = useState([])
    const [bookings, setBookings] = useState([])
    const [bookedIds, setbookedIds] = useState([])

    const { userId } = useContext(AppContext)

    const [getUserEvents] = useLazyQuery(GET_USER,{
        onCompleted: someData => {
            setUserEvents(someData.user.createdEvents)
        }
    })

    const [getBookedEvents] = useLazyQuery(GET_BOOKED_EVENTS,{
        onCompleted: d => {
            setBookings(d.bookings)
            let res = []
            d.bookings.forEach(b => {
                res.push(b.event.id)
            })
            setbookedIds(res)
        }
    })

    const { data, loading } = useQuery(GET_EVENTS)

    useEffect(() => {
        if(selected === 'user'){
            getUserEvents({ variables: { id: userId } })
        }
        if(selected === 'booked'){
            getBookedEvents({variables: {userId: userId}})
        }
    }, [getBookedEvents, getUserEvents, selected, userId])

    useEffect(() => {
        getBookedEvents({variables: {userId: userId}})
    }, [getBookedEvents, selected, userId])

    if (loading) {
        return <p>Loading...</p>
    }


    return (
        <div className="view-container">

            <div className="view-flex">
                <div className="sub-container flex-child">

                    <Tools 
                    setSelected={setSelected}
                    selected={selected}/>

                    <div className="cards-container">
                        {
                            selected === 'all' ? (
                                data.events.map(e => (
                                    <EventCard 
                                    event={e} 
                                    selected={selected} 
                                    booked={bookedIds}
                                    setSelected={setSelected} />
                                ))
                            )
                            : selected === 'user' ? userEvents.map(e => (
                                <EventCard 
                                event={e} 
                                selected={selected}
                                setSelected={setSelected} />
                            ))
                            : bookings.map(b => (
                                <EventCard 
                                booking={b}
                                event={b.event} 
                                selected={selected}
                                setSelected={setSelected} />
                            ))
                        }
                    </div>
                </div>


                <div className="form-container flex-child">
                    <FormContainer />
                </div>
            </div>
        </div>
    )
}

export default Events
