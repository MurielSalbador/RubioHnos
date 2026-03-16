import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = () => {
  return (
    <div className="skeleton-product-card">
      <div className="skeleton-image-wrapper">
        <div className="skeleton-image shimmer"></div>
      </div>
      <div className="skeleton-info">
        <div className="skeleton-title shimmer"></div>
        <div className="skeleton-brand shimmer"></div>
        <div className="skeleton-footer">
          <div className="skeleton-price shimmer"></div>
          <div className="skeleton-button shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
