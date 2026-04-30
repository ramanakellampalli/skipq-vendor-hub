import { useEffect } from 'react';
import { useVendorStore } from '../store/vendorStore';
import { orderAlert } from '../utils/orderAlert';

export function useOrderAlert() {
  const pendingCount = useVendorStore(state => state.pendingAlertIds.size);

  useEffect(() => {
    if (pendingCount > 0) {
      orderAlert.start();
    } else {
      orderAlert.stop();
    }
    return () => { orderAlert.stop(); };
  }, [pendingCount]);
}
