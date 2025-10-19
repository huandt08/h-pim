import React from 'react';
import { Card } from 'antd';
import ProductCompleteness from '../../components/ProductCompleteness';

const ProductCompletenessPage: React.FC = () => {
  return (
    <div>
      <ProductCompleteness showBatchActions={true} />
    </div>
  );
};

export default ProductCompletenessPage;