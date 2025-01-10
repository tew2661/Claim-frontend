'use client';
import './style.scss'
import React from 'react';

export default function Footer({ children }: { children : React.ReactNode }) {
  return (
    <div className='class-custom-bar-footer'>{children}</div>
  );
}
