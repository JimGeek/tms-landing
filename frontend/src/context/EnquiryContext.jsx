import React, { createContext, useContext, useState } from 'react';

const EnquiryContext = createContext();

export const useEnquiry = () => useContext(EnquiryContext);

export const EnquiryProvider = ({ children }) => {
  const [enquiry, setEnquiry] = useState({ open: false, product: null, sourcePage: '' });

  const openEnquiry = ({ product = null, sourcePage = '' } = {}) =>
    setEnquiry({ open: true, product, sourcePage });
  const closeEnquiry = () =>
    setEnquiry((prev) => ({ ...prev, open: false }));

  return (
    <EnquiryContext.Provider value={{ ...enquiry, openEnquiry, closeEnquiry }}>
      {children}
    </EnquiryContext.Provider>
  );
};
