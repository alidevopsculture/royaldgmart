const Product = require('../Models/ProductSchema');
const taxConfig = require('../config/tax');

exports.disableProducts = products => {
  let bulkOptions = products.map(item => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { isActive: false }
      }
    };
  });

  Product.bulkWrite(bulkOptions);
};

// calculate order tax amount
exports.caculateTaxAmount = order => {
  try {
    const taxRate = taxConfig.stateTaxRate;

    order.totalTax = 0;
    if (order.products && order.products.length > 0) {
      order.products.forEach(item => {
        const price = item.purchasePrice || (item?.product?.price ?? 0);
        const quantity = item.quantity;
        item.totalPrice = price * quantity;
        item.purchasePrice = price;

        // Only calculate tax for non-cancelled items
        if (item.status !== 'Cancelled') {
          // Check if item has a product with taxable property
          const isTaxable = item.product?.taxable !== undefined ? item.product.taxable : true;
          
          if (isTaxable) {
            // Calculate tax amount
            const taxAmount = price * taxRate;
            item.totalTax = parseFloat(
              Number((taxAmount * quantity).toFixed(2))
            );

            order.totalTax += item.totalTax;
          } else {
            item.totalTax = 0;
          }
        } else {
          item.totalTax = 0;
        }

        item.priceWithTax = parseFloat(
          Number((item.totalPrice + item.totalTax).toFixed(2))
        );
      });
    }

    // Recalculate total to ensure it's correct
    order.total = this.caculateOrderTotal(order);

    order.totalWithTax = order.total + order.totalTax;
    order.total = parseFloat(Number(order.total.toFixed(2)));
    order.totalTax = parseFloat(
      Number(order.totalTax && order.totalTax.toFixed(2))
    );
    order.totalWithTax = parseFloat(Number(order.totalWithTax.toFixed(2)));
    return order;
  } catch (error) {
    console.error('Error calculating tax amount:', error);
    return order;
  }
};

exports.caculateOrderTotal = order => {
  const total = order.products
    .filter(item => item.status !== 'Cancelled')
    .reduce((sum, current) => sum + current.totalPrice, 0);

  return total;
};

// calculate order tax amount
exports.caculateItemsSalesTax = items => {
  const taxRate = taxConfig.stateTaxRate;

  const products = items.map(item => {
    item.priceWithTax = 0;
    item.totalPrice = 0;
    item.totalTax = 0;
    item.purchasePrice = item.price;

    const price = item.purchasePrice;
    const quantity = item.quantity;
    item.totalPrice = parseFloat(Number((price * quantity).toFixed(2)));

    if (item.taxable) {
      const taxAmount = price * (taxRate / 100) * 100;

      item.totalTax = parseFloat(Number((taxAmount * quantity).toFixed(2)));
      item.priceWithTax = parseFloat(
        Number((item.totalPrice + item.totalTax).toFixed(2))
      );
    }

    return item;
  });

  return products;
};

exports.formatOrders = orders => {
  const newOrders = orders.map(order => {
    return {
      _id: order._id,
      total: parseFloat(Number(order.total.toFixed(2))),
      created: order.created,
      products: order?.cart?.products
    };
  });

  return newOrders.map(order => {
    return order?.products ? this.caculateTaxAmount(order) : order;
  });
};
