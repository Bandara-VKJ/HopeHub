from rag_service import (
    generate_counseling_response
)


print("=" * 70)
print("HOPEHUB AI COUNSELOR TEST")
print("=" * 70)


conversation_history = []


while True:

    user_message = input(
        "\nYou: "
    ).strip()


    if user_message.lower() in {
        "exit",
        "quit"
    }:

        print(
            "\nTest finished."
        )

        break


    if not user_message:

        continue


    try:

        response = (
            generate_counseling_response(

                user_message=
                    user_message,

                conversation_history=
                    conversation_history,

                memory_summary="",

                last_topic="",

            )
        )


        print(
            "\nHopeHub AI Counselor:"
        )

        print(
            response
        )


        # Save temporary conversation
        # for this test session.

        conversation_history.append({

            "role":
                "user",

            "content":
                user_message,

        })


        conversation_history.append({

            "role":
                "assistant",

            "content":
                response,

        })


    except Exception as error:

        print(
            "\nERROR:"
        )

        print(
            repr(error)
        )