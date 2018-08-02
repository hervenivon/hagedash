import React from 'react';
import {
  Nav,
  Navbar,
  NavbarBrand,
  NavItem,
  NavLink,
} from 'reactstrap';

import logo from '../logo.svg';

const NavBar = () => (
  <Navbar color="primary" dark expand="lg">
    <NavbarBrand href="/">
      <img src={logo} alt="Buzzard logo" height="40px" />{' '}
      Buzzard dashboard
    </NavbarBrand>
    <Nav horizontal="end">
      <NavItem>
        <NavLink href="https://github.com/airware/buzzard/" target="_blank">GitHub</NavLink>
      </NavItem>
      <NavItem>
        <NavLink href="https://readthedocs.org/projects/buzzard/" target="_blank">Documentation</NavLink>
      </NavItem>
    </Nav>
  </Navbar>
);

export default NavBar;
