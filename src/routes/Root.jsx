import { Fragment, useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import { faMoon } from "@fortawesome/free-solid-svg-icons";

import {
  Outlet,
  NavLink,
  useLoaderData,
  Form,
  redirect,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { getContacts, createContact } from "../contacts";

import { gsap } from "gsap";
const animation = gsap.timeline({
  paused: false,
  reversed: true,
  ease: "expo.inOut",
  duration: 0.0000000001,
});

export async function loader({ request }) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return { contacts, q };
}

export async function action() {
  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
  // return { contact };
}

export default function Root() {
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const wrapperRef = useRef();
  useEffect(() => {
    const circle = wrapperRef.current.querySelector(".circle");
    animation.to(circle, { x: "2rem" })

  });
  const circleClickHandler = () => {
    animation.reversed() ? animation.play() : animation.reverse();
  };

  const { contacts, q } = useLoaderData();
  const navigation = useNavigation();

  useEffect(() => {
    document.getElementById("q").value = q;
  }, [q]);

  const submit = useSubmit();

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  return (
    <Fragment className={`App ${theme}`}>

      <div id="sidebar">
        <h1 className="intro-header">React Router Contacts</h1>
        {/* <DarkMode/> */}
        {/* <button onClick={toggleTheme}>Dark mode Thene</button> */}
        <div className ref={wrapperRef} onClick={toggleTheme}>
        <div className="toggle" onClick={circleClickHandler}>
          <div>
            <FontAwesomeIcon icon={faSun} className="sun" />
          </div>
          <div>
            <FontAwesomeIcon icon={faMoon} className="moon" />
          </div>
          <div className="circle"></div>
        </div>
      </div>
        <div>
          <Form id="search-form" role="search">
            <input
              id="q"
              className={searching ? "loading" : ""}
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
              defaultValue={q}
              onChange={(event) => {
                const isFirstSearch = q == null;
                submit(event.currentTarget.form, {
                  replace: !isFirstSearch,
                });
              }}
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  {/* <Link to={`contacts/${contact.id}`}>
                    
                  </Link> */}

                  <NavLink
                    to={`contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}{" "}
                    {contact.favorite && <span>★</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>

      <div
        id="detail"
        className={navigation.state === "loading" ? "loading" : ""}
      >
        <Outlet />
      </div>
    </Fragment>
  );
}
