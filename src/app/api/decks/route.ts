import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: decks, error } = await supabase.from('decks').select('*').eq('is_public', true).order('created_at', {
            ascending: false
        })

        if(error) {
            return NextResponse.json({
                error: error.message,
                status: 500
            })
        }

        return NextResponse.json({
            decks: decks ?? []
        })

    } catch (error) {
        return NextResponse.json({
            error: (error as Error).message
        }, {
            status: 500
        })
    }
}