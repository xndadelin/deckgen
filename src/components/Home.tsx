import useUser from "@/utils/queries/useUser";
import Loading from "./page";

export default function Home() {
    const { data: user, isLoading } = useUser();

    if(isLoading) return <Loading />
    if(!user) return null;

    return (
        <div></div>
    )

}