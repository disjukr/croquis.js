import React, { useState } from 'react';
import cx from 'classnames';

const Menu: React.FC = () => {
  const [open, setOpen] = useState(false);
  return <div className={cx('menu', open && 'open')}>
    <div className='background'/>
    <button className='menu-button' onClick={() => setOpen(!open)}/>
    <style jsx>{`
      .menu {
        position: absolute;
        top: 0;
        transform: translateX(-100%);
        width: calc(100vw - 3em);
        height: 100vh;
        transition: transform 0.3s;
      }
      .open {
        transform: none;
      }
      .menu-button {
        padding: 0;
        position: absolute;
        top: 50%;
        left: 100%;
        width: 2em;
        height: 6em;
        transform: translateY(-50%);
        background: none;
        border: none;
        outline:none;
      }
      .menu-button:after {
        content: '';
        position: absolute;
        width: 50%;
        height: 2em;
        transform: translate(-100%, -50%);
        border-right: 5px dotted #ccc;
      }
      .background {
        width: 100%;
        height: 100%;
        background-color: #fff;
        filter: drop-shadow(1px 0 0 #ddd);
      }
      .background:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 100%;
        height: 3em;
        transform: translateY(-50%);
        border-top: 1em solid transparent;
        border-bottom: 1em solid transparent;
        border-left: 1.5em solid white;
      }
    `}</style>
  </div>;
};

export default Menu;
