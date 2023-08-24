using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using TetrisChallenge.Domain.ValueObjects;

namespace TetrisChallenge.Application.Response
{
    public class Response : IResponse
    {
        #region props

        public ResponseStateEnumeration State { get; set; } = ResponseStateEnumeration.Unknown;
        public List<ResponseMessage> MessageStack { get; set; } = new List<ResponseMessage>();

        #endregion
        #region methods

        public void AddMessage(Exception ex)
        {
            var message = new ResponseMessage
            {
                Context = ex.Source
            };

            message.Display.Value = ex.Message;
            message.LogText = ex.ToString();

            try
            {
                // Get stack trace for the exception with source file information
                var st = new StackTrace(ex, true);

                // Get the top stack frame
                var frame = st.GetFrame(st.FrameCount - 1);

                if (frame != null)
                {
                    message.LineNumber = frame.GetFileLineNumber();
                    message.Caller = frame.GetFileName();
                }
            }
            catch (Exception) { }

            MessageStack.Add(message);
        }

        public void AddMessage(ResponseMessage message)
        {
            if (message != null)
                MessageStack.Add(message);
        }

        public void AddMessage(LocalizableValue localizedMessage, string context, string logMessage = null, [CallerLineNumber] int lineNumber = -1, [CallerMemberName] string caller = null)
        {
            var message = new ResponseMessage
            {
                Display = localizedMessage,
                Context = context
            };

            if (logMessage != null)
                message.LogText = logMessage;

            if (lineNumber > 0)
                message.LineNumber = lineNumber;

            if (caller != null)
                message.Caller = caller;

            MessageStack.Add(message);
        }

        #endregion
    }

    public class Response<T> : Response, IResponse<T>
    {
        #region ctor

        public Response()
        {
            Payload = default;
        }

        public Response(T payload)
        {
            Payload = payload;
        }

        public Response(T payload, ResponseStateEnumeration state)
        {
            State = state;
            Payload = payload;
        }

        #endregion
        #region props

        public T Payload { get; set; } = default;

        #endregion
    }
}
