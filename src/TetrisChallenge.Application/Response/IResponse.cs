using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using TetrisChallenge.Domain.ValueObjects;

namespace TetrisChallenge.Application.Response
{
    public interface IResponse
    {
        ResponseStateEnumeration State { get; set; }
        List<ResponseMessage> MessageStack { get; set; }

        void AddMessage(Exception ex);
        void AddMessage(ResponseMessage message);
        void AddMessage(LocalizableValue localizedMessage, string context, string logMessage = null, [CallerLineNumber] int lineNumber = -1, [CallerMemberName] string caller = null);
    }


    public interface IResponse<T> : IResponse
    {
        T Payload { get; set; }
    }
}
