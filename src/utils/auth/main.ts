import { notifications } from "@mantine/notifications";
import { createClient } from "../supabase/client";

export default async function authenticateUser() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'slack_oidc'
    })
    if (error) {
        notifications.show({
            title: 'Authentication error',
            message: error.message,
            color: 'red',
        })
    }
}