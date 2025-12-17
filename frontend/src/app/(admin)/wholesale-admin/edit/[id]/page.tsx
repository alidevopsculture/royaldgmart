import EditWholesaleProduct from "@/components/component/edit-wholesale-product";

export default function EditWholesalePage({ params }: { params: { id: string } }) {
    return <EditWholesaleProduct productId={params.id} />;
}
