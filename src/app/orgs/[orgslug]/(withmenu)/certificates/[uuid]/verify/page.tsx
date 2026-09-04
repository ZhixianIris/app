import CertificateVerificationPage from '@components/Pages/Certificate/CertificateVerificationPage';
import React from 'react';
import { useParams } from 'react-router-dom';

const CertificateVerifyPage: React.FC = () => {
  const { uuid } = useParams() as { uuid: string };
  return <CertificateVerificationPage certificateUuid={uuid ?? ''} />;
};

export default CertificateVerifyPage;
