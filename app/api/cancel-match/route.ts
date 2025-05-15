import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Create a Supabase client for the route handler with cookies
    const supabase = createRouteHandlerClient({ cookies })

    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If there's no session, return unauthorized
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required", message: "You must be logged in to cancel matchmaking." },
        { status: 401 },
      )
    }

    // Get the current user's ID
    const userId = session.user.id

    // Delete any matchmaking entries for this user
    const { error: deleteError } = await supabase
      .from("matchmaking")
      .delete()
      .eq("user_id", userId)
      .eq("status", "waiting")

    if (deleteError) {
      console.error("Error deleting matchmaking entry:", deleteError)
      return NextResponse.json({ error: "Database error", message: "Failed to cancel matchmaking." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Matchmaking canceled successfully",
    })
  } catch (error) {
    console.error("Error in cancel-match API:", error)
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to process cancellation request" },
      { status: 500 },
    )
  }
}
